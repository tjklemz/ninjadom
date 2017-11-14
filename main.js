function updateElement(dom, newTree, tree, index) {
  if (index === undefined) {
    index = 0
  }

  if (!tree) {
    dom.appendChild(
      createElement(newTree)
    )
  } else if (!newTree) {
    dom.removeChild(
      dom.childNodes[index]
    )
  } else if (newTree !== tree) {
    dom.replaceChild(
      create(newTree),
      dom.childNodes[index]
    )
  } else if (newTree.tag) {
    var newLength = newTree.get('children').count()
    var oldLength = tree.get('children').count()

    for (var i = 0; i < newLength || i < oldLength; i++) {
      updateElement(
        dom.childNodes[index],
        newTree.getIn(['children', i]),
        tree.getIn(['children', i]),
        i
      );
    }
  }
}

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
    children: Immutable.List(children)
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

var ninjaRoot = document.getElementById('ninja-root')
ninjaRoot.innerHTML = ''
ninjaRoot.appendChild(create(tree))

setTimeout(function renderLoop() {
  var newState = reducer(state, { type: 'INC' })
  if (newState !== state) {
    state = newState

    var newTree = render(state)

    if (newTree !== tree) {
      updateElement(ninjaRoot, newTree, tree)
      tree = newTree
    }
  }
  setTimeout(renderLoop, 0)
}, 0)
