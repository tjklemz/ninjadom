function create(tree) {
  var el = document.createElement(tree.get('tag'))

  tree.get('children').forEach(function (child) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child))
      return
    }

    el.appendChild(create(child))
  })

  return el
}

function h(tag, props, children) {
  return Immutable.Map({
    tag: tag,
    props: Immutable.Map(props),
    children: children && Immutable.List(children)
  })
}

function render(state) {
  return h('div', {
    style: {
      color: 'red'
    }
  }, [
    h('h1', {}, [String(state.get('count'))])
  ])
}

function reducer(state, action) {
  if (!state) {
    state = Immutable.Map({
      count: 0
    })
  }

  switch (action.type) {
    case 'INC':
      return state.set('count', state.get('count') + 1)
    case 'DEC':
      return state.set('count', state.get('count') - 1)
    default:
      return state
  }
}

var state = reducer(null, {})
var tree = render(state)

var dom = create(tree)

var ninjaRoot = document.getElementById('ninja-root')
ninjaRoot.innerHTML = ''
ninjaRoot.appendChild(dom)

setTimeout(function renderLoop() {
  var newState = reducer(state, { type: 'INC' })
  if (newState !== state) {
    state = newState

    var tree = render(state)
    dom = create(tree)
    ninjaRoot.innerHTML = ''
    ninjaRoot.appendChild(dom)
  }
  setTimeout(renderLoop, 1500)
}, 1500)
