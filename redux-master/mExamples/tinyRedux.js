/// tinyredux start
function createStore(reducer, state = {}) {
  return new Store(reducer, state)
}

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
  const enArr = args.map(middleware => middleware({
    getState: store.getState,
    dispatch: store.dispatch
  }))


  let of = store.dispatch
  enArr.forEach(en => {
    of = en(of)
  })

  store.dispatch = of
}

function bindActionCreator(creator, dispatch) {
  return function (...args) {
    dispatch(creator(args))
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
        hasChange = true
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
/// tinyredux end

//// middleware
var fEnhancer = function ({getState, dispatch}) {
  return function (originF) {
    return function (...args) {
      console.log('this is fEnhancer before', getState())
      console.log('action:', args[0])
      var r = originF(...args)
      console.log('this is fEnhancer after', getState())
      return r
    }
  }
}

var hEnhancer = function ({getState, dispatch}) {
  return function (originF) {
    return function (...args) {
      console.log('this is hEnhancer before')
      var r = originF(...args)
      console.log('this is hEnhancer after')
      return r
    }
  }
}

var gEnhancer = function ({getState, dispatch}) {
  return function (originF) {
    return function (...args) {
      console.log('this is gEnhancer before')
      var r = originF(...args)
      console.log('this is gEnhancer after')
      return r
    }
  }
}


/// reducer
function clockReducer(state, action) {
  switch (action.type) {
    case 'clock_addOne': {
      return {
        ...state,
        count: state.count + 1
      }
    }
    case 'clock_cnum': {
      return {
        ...state,
        count: state.count * action.num
      }
    }
    default: {
      return state
    }
  }
}

function ykReducer(state, action) {
  switch (action.type) {
    case 'yk_older': {
      return {
        ...state,
        age: state.age + 1
      }
    }
    case 'yk_forever18': {
      return {
        ...state,
        age: 18
      }
    }
    default: {
      return state
    }
  }
}

const myReducer = combineReducers({
  clock: clockReducer,
  yk: ykReducer
})

var store = createStore(myReducer, {
  clock: {
    count: 0
  },
  yk: {
    age: 0
  }
})
applyMiddleware(store, fEnhancer, hEnhancer, gEnhancer)

const addOne = () =>({
  type: 'clock_addOne'
})

const cnum = num =>({
  type: 'clock_cnum',
  num
})

const older = () => ({
  type: 'yk_older'
})

const byebyeOlder = () => ({
  type: 'yk_forever18'
})

const crs = bindActionCreators({
  addOne,
  cnum,
  older,
  byebyeOlder
}, store.dispatch)

crs.addOne()
crs.cnum(3)
crs.addOne()

crs.older()
crs.byebyeOlder()

