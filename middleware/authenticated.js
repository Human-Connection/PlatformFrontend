export default function ({ store, route, redirect }) {
  if (route.path.indexOf('/auth') !== 0 &&
      route.path.indexOf('/legal') !== 0 &&
      !store.getters['auth/isAuthenticated']) {
    return redirect('/auth/login', {
      path: route.path
    })
  }
}
