<?php


header("Content-Type: application/json; charset=UTF-8");

$latitude  = $_GET["lat"] ?? "";
$longitude = $_GET["lon"] ?? "";

echo json_encode([
    "provider" => "GPV",
    "status"   => "ready",
    "latitude" => $latitude,
    "longitude"=> $longitude,
    "current" => [
        "temperature_2m" => 0,
        "cloud_cover" => 0,
        "precipitation" => 0,
        "wind_speed_10m" => 0
    ],
    "hourly" => [
        "time" => [],
        "temperature_2m" => [],
        "precipitation" => [],
        "cloud_cover" => [],
        "wind_speed_10m" => []
    ]
]);
