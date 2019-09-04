//
function createStore(reducer, state = {}) {
  return new Store(reducer, state)
}

/**
 * store
 */
class Store {
  constructor(reducer, state) {
    this.state = state
    this.listeners = []
    this.reducer = reducer

    this.dispatch = this.dispatch.bind(this)
    this.getState = this.getState.bind(this)
    this.subscribe = this.subscribe.bind(this)
  }

  dispatch(action) {
    this.state = this.reducer(this.state, action)

    this.listeners.forEach(listener => listener())
  }

  getState() {
    return this.state
  }

  subscribe(listener) {
    this.listeners.push(listener)
  }

}

function applyMiddleware(store, ...args) {
  console.log(args)
  const enArr = args.map(midderware => midderware({
    getState: store.getState,
    dispatch: store.dispatch
  }))
  // compose
  let of = store.dispatch
  enArr.forEach(en => {
    of = en(of)
  })
  store.dispatch = of
}

function bindActionCreator(creator, dispatch) {
  return function (...args) {
    dispatch(args)
  }
}

function bindActionCreators(creators, dispatch) {
  const keys = Object.keys(creators)
  const result = {}
  keys.forEach(key => {
    result[key] = bindActionCreator(creators[key], dispatch)
  })
  return result
}

function combineReducers(reducers) {
  return function (state, action) {
    const keys = Object.keys(reducers)

    let hasChange = false
    const newState = {}
    keys.forEach(key => {
      const newS = reducers[key](state[key], action)
      if (newS !== state[key]) {
        newState[key] = newS
      } else {
        newState[key] = newS
      }
    })
    return hasChange ? newState: state
  }
}

function combineReducersVariant(reducers) {
  return function (state, action) {
    const lineIndex = action.type.indexOf("_")
    const actionKey = action.type.substring(0, lineIndex)
    const newS = reducers[actionKey](state[actionKey], action)

    return state[actionKey] === newS ? state : {
      ...state,
      [actionKey]: newS
    }
  }
}

