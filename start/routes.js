'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
const fs = use('fs')
const Helpers = use('Helpers')
const readFile = Helpers.promisify(fs.readFile)

/*
|--------------------------------------------------------------------------
|                                  VIEWS
|--------------------------------------------------------------------------
*/

Route.on('/').render('welcome')
Route.get('/admin', 'UserController.admin').middleware(['isAdmin:auth'])
Route.get('/profile', 'UserController.profile').middleware(['auth'])
Route.get('/staff', 'UserController.staff').middleware(['auth'])
Route.get('/donate/:wallet', 'UserController.donate')

Route.get('/manifest.json', async ({ response }) => {
  return await readFile('./manifest.json')
})

/*
|--------------------------------------------------------------------------
|                                 PASSPORT
|--------------------------------------------------------------------------
*/

Route.get('/passport/new', 'UserController.passportView').middleware(['auth'])
Route.on('/passport/validate').render('validate').middleware(['auth'])

/*
|--------------------------------------------------------------------------
|                                 WEBHOOK
|--------------------------------------------------------------------------
*/

Route.post('/opentimestampsinvoice/paid', 'OpenNodeController.opentimestampsInvoicePaid')
Route.post('satelliteinvoice/paid', 'OpenNodeController.satelliteInvoicePaid')


/*
|--------------------------------------------------------------------------
|                                  API
|--------------------------------------------------------------------------
*/

Route.group(() => {
  Route.post('auth/verify-signature', 'UserController.digitalSignature')
  Route.post('demo/doctor', 'UserController.demoDoctor')
  Route.post('demo/admin', 'UserController.demoAdmin')
  Route.post('demo/staff', 'UserController.demoStaff')
  Route.post('auth/logout', 'UserController.logout')
  Route.post('auth/login', 'UserController.login')
  Route.post('auth/blockstack-login', 'UserController.blockstackLogin')
  Route.post('passport/new', 'UserController.newPassport')
  Route.post('profile/edit', 'UserController.edit')
  Route.post('profile/link-node', 'UserController.updateDonationPage')
  Route.post('profile/delete', 'UserController.deleteAccount')
  Route.post('passport/satellite', 'UserController.paySatellite')
  Route.post('passport/opentimestamps', 'UserController.payOpenTimeStamps')
  Route.post('users/create-new', 'UserController.createUser')
  Route.post('clinics/create-new', 'UserController.createClinic')
  Route.post('users/join-clinic', 'UserController.addUserToClinic')
  Route.post('users/remove-clinic', 'UserController.removeUserFromClinic')
  Route.post('passport/satellite/complete', 'UserController.satelliteComplete')
  Route.post('passport/ots/complete', 'UserController.otsComplete')
  Route.post('passport/satellite/validate', 'ValidateController.validate')

}).prefix('api/v0')