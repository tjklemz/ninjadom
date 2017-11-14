function changes(node1, node2) {
  return (typeof node1 === 'string' && node1 !== node2) ||
         node1.get('tag') !== node2.get('tag')
}

function updateElement(dom, newTree, tree, index) {
  if (index === undefined) {
    index = 0
  }

  if (!tree) {
    dom.appendChild(
      create(newTree)
    )
  } else if (!newTree) {
    dom.removeChild(
      dom.childNodes[index]
    )
  } else if (changes(tree, newTree)) {
    dom.replaceChild(
      create(newTree),
      dom.childNodes[index]
    )
  } else if (newTree.get('tag')) {
    var same = newTree.get('children').equals(tree.get('children'))

    if (same) {
      return
    }

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
  var list = []
  for (var i = 0, len = state.get('count'); i < len; ++i) {
    list.push(h('li', {}, ['stuff']))
  }

  return h('div', {
    style: {
      color: 'red'
    }
  }, [
    //h('h1', {}, [String(state.get('count'))]),
    h('ul', {}, list)
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

function update() {
  var newState = reducer(state, { type: 'INC' })

  if (newState !== state) {
    state = newState

    var newTree = render(state)
    updateElement(ninjaRoot, newTree, tree)
    tree = newTree
  }
}
