import { mutations, actions } from './comments.js'
import feathers from '@feathersjs/feathers'

let state
let dispatch
let commit

beforeEach(() => {
  dispatch = jest.fn(() => Promise.resolve())
  commit = jest.fn()
  state = {}
})

describe('isLoading', () => {
  test('sets status', () => {
    state = {
      status: false
    }
    mutations.isLoading(state, true)
    expect(state.isLoading).toBe(true)
  })
})

describe('given a mock api', () => {
  let action
  let comments = []
  let api

  beforeEach(() => {
    api = feathers()
    api.use('/comments', {
      async find () {
        return {
          data: comments,
          total: comments.length
        }
      }
    })
  })

  describe('fetchByContributionId', () => {
    beforeEach(() => {
      const module = { app: { $api: api } }
      action = actions.fetchByContributionId.bind(module)
    })

    afterEach(() => {
      action = null
    })

    describe('no given contribution id', () => {
      test('returns without any commit', async () => {
        await action({state, dispatch, commit})
        expect(dispatch).not.toHaveBeenCalled()
        expect(commit).not.toHaveBeenCalled()
      })
    })

    describe('given a contribution id', () => {
      test('updates the set of preloaded comments', async () => {
        state = { comments: [] }
        await action({state, dispatch, commit}, 42)
        const expected = [
          [ 'setContributionId', 42 ],
          [ 'set', [] ],
          [ 'setCommentCount', 0 ],
          [ 'isLoading', false ]
        ]
        expect(commit.mock.calls).toEqual(expected)
      })

      test('sets comments and commentCount', async () => {
        state = { comments: [] }
        comments = [{_id: 23}]
        await action({state, dispatch, commit}, 42)
        const expected = [
          [ 'setContributionId', 42 ],
          [ 'set', [{_id: 23}] ],
          [ 'setCommentCount', 1 ],
          [ 'isLoading', false ]
        ]
        expect(commit.mock.calls).toEqual(expected)
      })
    })
  })

  describe('fetchAllByContributionId', () => {
    beforeEach(() => {
      const module = { app: { $api: api } }
      action = actions.fetchAllByContributionId.bind(module)
    })

    afterEach(() => {
      action = null
    })

    test('calls fetchByContributionId', async() => {
      state = { comments: [] }
      await action({state, dispatch, commit}, 42)
      expect(dispatch).toHaveBeenCalled()
    })

    describe('given too many comments', () => {
      let step
      beforeEach(() => {
        step = 0
        api.use('/comments', {
          async find () {
            step++
            return {
              data: comments[step],
              total: 3
            }
          }
        })
      })
    })
  })
})
