(function (global) {
  function changes(node1, node2) {
    return (typeof node1 === 'string' && node1 !== node2) ||
           node1.get('tag') !== node2.get('tag')
  }

  function pluckKey(child) {
    return child && child.get ? child.getIn(['props', 'key']) : null
  }

  function updateElement(parent, newTree, tree, index, deletionQueue) {
    if (index === undefined) {
      index = 0
    }

    if (!tree) {
      parent.appendChild(create(newTree))
    } else if (!newTree || deletionQueue && deletionQueue.includes(pluckKey(tree))) {
      parent.removeChild(
        parent.childNodes[index]
      )
    } else if (changes(tree, newTree)) {
      parent.replaceChild(
        create(newTree),
        parent.childNodes[index]
      )
    } else if (newTree.get('tag')) {
      var same = newTree.get('children').equals(tree.get('children'))

      if (!same) {
        var newLength = newTree.get('children').count()
        var oldLength = tree.get('children').count()

        var oldKeys = tree.get('children').map(pluckKey).toSet()
        var newKeys = newTree.get('children').map(pluckKey).toSet()
        var diff = oldLength > newLength ? oldKeys.subtract(newKeys) : newKeys.subtract(oldKeys)

        var diffToDelete = oldKeys.subtract(newKeys)

        var shouldDiff = (newKeys.size === newLength)

        var theTree = oldLength > newLength ? tree : newTree

        for (var i = 0; i < newLength || i < oldLength; i++) {
          var child = theTree.getIn(['children', i])
          var code = pluckKey(child)

          console.log(code, diff.includes(code))

          if (!shouldDiff || code && diff.includes(code)) {
            updateElement(
              parent.childNodes[index],
              newTree.getIn(['children', i]),
              tree.getIn(['children', i]),
              i,
              diffToDelete
            )
          }
          rebind(parent.childNodes[index], tree, newTree)
        }
      }
    }
  }

  function rebind(el, tree, newTree) {
    var oldProps = tree && tree.get && tree.get('props')

    if (newTree && newTree.get && !newTree.get('props').equals(oldProps)) {
      // rebind props
      newTree.get('props').forEach(bind(el, oldProps))
    }
  }

  function bind(el, old) {
    return function (value, key) {
      if (key.startsWith('on')) {
        var name = key.replace(/^on/, '').toLowerCase()
        old && el.removeEventListener(name, old.get(key))
        el.addEventListener(name, value)
        el.dataset.render = +el.dataset.render + 1
      }
    }
  }

  function create(tree) {
    if (typeof tree === 'string') {
      return document.createTextNode(tree)
    }

    var el =  document.createElement(tree.get('tag'))

    el.dataset.render = 0

    var index = tree.get('props').get('index')
    if (index !== undefined) {
      el.dataset.index = index
    }

    tree.get('props').forEach(bind(el, null))

    tree.get('children').forEach(function (child) {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child))
        return
      }

      var elChild = create(child)
      elChild.dataset.render = 0

      el.appendChild(elChild)
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

  function dispatch(action) {
    console.log('DISPATCH', action)
    var newState = reducer(state, action)
    update(newState)
  }

  var _update = debounce(function () {
    var newTree = render(state)
    updateElement(ninjaRoot, newTree, tree)
    tree = newTree
  }, 1)

  function update(newState) {
    if (newState !== state) {
      state = newState

      _update()
    }
  }

  var state
  var tree
  var ninjaRoot

  function ninja (container) {
    state = global.reducer(null, {})
    tree = global.render(state)

    ninjaRoot = container
    ninjaRoot.innerHTML = ''
    updateElement(ninjaRoot, tree)
  }

  global.h = h
  global.dispatch = dispatch
  global.render = function () {}
  global.reducer = function () {
    return Immutable.Map({})
  }
  global.ninja = ninja
}(window))
