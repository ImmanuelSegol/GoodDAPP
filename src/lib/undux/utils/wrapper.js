function isFunction(functionToCheck) {
  return typeof functionToCheck === 'function'
}

const wrapperFunction = (origMethod, target, handler) => {
  return function(...args) {
    handler.beforeFetching()
    let result = origMethod.apply(target, args)
    if (isFunction(result.then)) {
      result.then(handler.afterFetching).catch(handler.errorHandler)
    }
    return result
  }
}

function Handler(store, params) {
  const { onDismiss } = params || {}
  this.beforeFetching = () =>
    store.set('currentScreen')({
      loading: true
    })

  this.afterFetching = () =>
    store.set('currentScreen')({
      loading: false
    })

  this.errorHandler = error => {
    let message = 'Unknown Error'
    if (error.response && error.response.data) {
      message = error.response.data.message
    }
    if (error.message) {
      message = error.message
    }
    if (error.err) {
      message = error.err
    }
    store.set('currentScreen')({
      dialogData: { visible: true, title: 'Error', message, dismissText: 'OK', onDismiss },
      loading: false
    })
  }
}

export const wrapFunction = (fn, store, params) => {
  const handler = new Handler(store, params)
  return wrapperFunction(fn, null, handler)
}

const wrapper = (target, store, params) => {
  const handler = new Handler(store, params)
  return new Proxy(target, {
    get: function(target, name, receiver) {
      const origMethod = target[name]
      if (!isFunction(target[name])) {
        return target[name]
      } else {
        return wrapperFunction(origMethod, target, handler)
      }
    }
  })
}

export default wrapper