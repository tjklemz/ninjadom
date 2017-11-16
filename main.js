function addTodo(title) {
  return { type: 'ADD_TODO', title: title }
}

function removeTodo(index) {
  return { type: 'REMOVE_TODO', index: index }
}

function render(state) {
  var list = state.map(function (todo, i) {
    return h('li', {
      key: todo.get('id')
    }, [
      todo.get('title'),
      h('span', {
        index: todo.get('id')
      }, ['X'])])
  })

  return h('div', {}, [
    h('h1', {}, ['Todo List']),
    h('input', {
      'onChange': function (event) {
        dispatch(addTodo(event.target.value))
      }
    }),
    h('button', {
      'onClick': function (event) {
        event.preventDefault()
        console.log('yoyo')
        dispatch({ type: 'INC' })
      }
    }, ["Click Me!"]),
    h('ul', {
      onClick: function (event) {
        event.preventDefault()

        var i = event.target.dataset.index

        console.log('SDF', event.target, this, i)
        
        dispatch(removeTodo(i))
      }
    }, list)
  ])
}

function reducer(state, action) {
  if (!state) {
    state = Immutable.List()
  }

  switch (action.type) {
    case 'ADD_TODO':
      return state.push(Immutable.Map({
        title: action.title,
        id: shortid.gen()
      }))
    case 'REMOVE_TODO':
      var index = state.findIndex(function (val) {
        return val.get('id') === action.index
      })
      return state.delete(index)
    default:
      return state
  }
}

ninja(document.getElementById('ninja-root'))

for (var i = 0; i < 1000; ++i) {
  dispatch(addTodo('For you: ' + i + ' - ' + (new Date())))
}

