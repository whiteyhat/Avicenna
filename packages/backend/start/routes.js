'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  Route.post('delete', 'UserController.deleteAccount')
  Route.post('create-new', 'UserController.createUser')
  Route.post('sign', 'UserController.login')
  Route.post('verify-signature', 'UserController.digitalSignature')
  Route.post('logout', 'UserController.logout')
}).prefix('api/v0')