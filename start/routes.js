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
Route.get('/profile', 'UserController.profile').middleware(['auth'])
Route.get('/staff', 'UserController.staff').middleware(['auth'])
Route.on('/new-passport').render('index').middleware(['auth'])
Route.get('/donate/:wallet', 'UserController.donate')

Route.on('/validate').render('validate')
Route.post('/validate', 'ValidateController.validate')


Route.group(() => {
  Route.post('auth/verify-signature', 'UserController.digitalSignature')
  Route.post('demo/doctor', 'UserController.demoDoctor')
  Route.post('demo/admin', 'UserController.demoAdmin')
  Route.post('auth/logout', 'UserController.logout')
  Route.post('auth/login', 'UserController.login')
  Route.post('passport/new', 'UserController.newPassport')
  Route.post('profile/edit', 'UserController.edit')
  Route.post('profile/link-node', 'UserController.noCustodial')
  Route.post('profile/delete', 'UserController.deleteAccount')
  Route.post('passport/satellite', 'UserController.paySatellite')
  Route.post('passport/opentimestamps', 'UserController.payOpenTimeStamps')
  Route.post('users/create-new', 'UserController.createUser')
  Route.post('clinics/create-new', 'UserController.createClinic')
  Route.post('users/join-clinic', 'UserController.addUserToClinic')
  Route.post('users/remove-clinic', 'UserController.removeUserFromClinic')
  Route.post('passport/satellite/complete', 'UserController.satelliteComplete')
  Route.post('passport/ots/complete', 'UserController.otsComplete')

}).prefix('api/v0')