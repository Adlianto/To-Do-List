<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index()
    {
        return Inertia::render('TodoList', [
            'tasks' => Task::all()
        ]);
    }

    public function updatePriority(Request $request, Task $task)
    {
        $task->update([
            'is_secondary' => $request->is_secondary
        ]);

        return back();
    }
}