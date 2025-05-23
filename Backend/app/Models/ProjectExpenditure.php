<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectExpenditure extends Model
{
    use HasFactory;

    protected $fillable = ['project_id', 'amount', 'description'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
