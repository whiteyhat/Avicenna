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
  Route.post('auth/sign', 'UserController.login')
  Route.post('auth/verify-signature', 'UserController.digitalSignature')
  Route.post('auth/logout', 'UserController.logout')
  
  
  Route.post('passport/new', 'UserController.newPassport')
  Route.post('passport/get', 'UserController.getPassport')
  Route.post('passport/call', 'UserController.getPassport')
}).prefix('api/v0')