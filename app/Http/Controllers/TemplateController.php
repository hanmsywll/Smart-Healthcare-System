<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TemplateController extends Controller
{
    /**
     * Show the main navigation page
     */
    public function index()
    {
        return view('main');
    }

    /**
     * Show admin template
     */
    public function admin()
    {
        return view('templates.admin');
    }

    /**
     * Show doctor template
     */
    public function doctor()
    {
        return view('templates.doctor');
    }

    /**
     * Show public template
     */
    public function public()
    {
        return view('templates.public');
    }
}