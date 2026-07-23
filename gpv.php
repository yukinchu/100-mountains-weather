<?php

header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    "status" => "ok",
    "message" => "GPV API Ready",
    "current" => [
        "temperature_2m" => 20.0,
        "cloud_cover" => 30,
        "precipitation" => 0,
        "wind_speed_10m" => 5
    ],
    "hourly" => [
        "time" => [],
        "temperature_2m" => [],
        "precipitation" => [],
        "cloud_cover" => [],
        "wind_speed_10m" => []
    ]
]);
