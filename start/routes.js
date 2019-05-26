'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('welcome')
Route.get('/admin', 'UserController.admin').middleware(['isAdmin:auth'])
Route.on('/profile').render('profile').middleware(['auth'])
Route.get('/staff', 'UserController.staff').middleware(['auth'])
Route.on('/new-passport').render('index').middleware(['auth'])


Route.group(() => {
  Route.post('auth/verify-signature', 'UserController.digitalSignature')
  Route.post('demo/doctor', 'UserController.demoDoctor')
  Route.post('demo/admin', 'UserController.demoAdmin')
  Route.post('auth/logout', 'UserController.logout')
  Route.post('auth/login', 'UserController.login')
  Route.post('passport/new', 'UserController.newPassport')
  Route.post('profile/edit', 'UserController.edit')

}).prefix('api/v0')