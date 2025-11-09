<?php

namespace App\Http\Controllers;

/**
 * @OA\OpenApi(
 *     @OA\Server(url="/api"),
 *     @OA\Info(
 *      version="1.0.0",
 *      title="Smart Healthcare System API",
 *      description="API for Smart Healthcare System",
 *      @OA\Contact(
 *          email="support@smart-healthcare.com"
 *      ),
 *      @OA\License(
 *          name="Apache 2.0",
 *          url="http://www.apache.org/licenses/LICENSE-2.0.html"
 *      )
 *     )
 * )
 * @OA\SecurityScheme(
 *     type="http",
 *     description="Login with email and password to get the authentication token",
 *     name="Token based Based",
 *     in="header",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     securityScheme="apiAuth",
 * )
 */
abstract class Controller
{
    //
}
