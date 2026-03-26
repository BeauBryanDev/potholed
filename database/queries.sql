-- Top five most damaged streets
SELECT 
    s.name AS calle, 
    t.name AS ciudad, 
    SUM(d.pothole_count) AS total_huecos
FROM detections d
JOIN images i ON d.image_id = i.id
JOIN streets s ON i.street_id = s.id
JOIN towns t ON s.town_id = t.id
GROUP BY s.id, s.name, t.name
ORDER BY total_huecos DESC
LIMIT 5;


-- ONNX model performace 

SELECT 
    model_version,
    COUNT(*) as total_procesadas,
    ROUND(AVG(inference_time_ms)::numeric, 2) as tiempo_promedio_ms,
    ROUND(AVG(confidence_avg)::numeric, 4) as confianza_media
FROM detections
GROUP BY model_version;


-- User Activiy Rpeort

SELECT 
    u.username, 
    COUNT(i.id) as fotos_subidas,
    SUM(d.pothole_count) as huecos_encontrados
FROM users u
LEFT JOIN images i ON u.id = i.user_id
LEFT JOIN detections d ON i.id = d.image_id
GROUP BY u.id, u.username
ORDER BY fotos_subidas DESC;


-- MOSt Detections logs

SELECT 
    id, 
    image_id, 
    pothole_count, 
    detections_json 
FROM detections 
WHERE json_array_length(detections_json) > 10;


SELECT 
    d.id, 
    s.name as calle, 
    d.pothole_count,
    json_array_length(d.detections_json) as elementos_en_json
FROM detections d
JOIN images i ON d.image_id = i.id
JOIN streets s ON i.street_id = s.id
WHERE json_array_length(d.detections_json) > 10
ORDER BY d.pothole_count DESC;

-- total baches 
SELECT 
    SUM(d.pothole_count) AS total_baches_global,
    SUM(CASE WHEN i.street_id IS NULL THEN d.pothole_count ELSE 0 END) AS baches_huerfanos,
    SUM(CASE WHEN i.street_id IS NOT NULL THEN d.pothole_count ELSE 0 END) AS baches_con_calle
FROM detections d
JOIN images i ON d.image_id = i.id;


-- get all images with no street
SELECT 
    i.id AS image_id, 
    i.original_filename, 
    d.pothole_count AS baches_detectados,
    i.uploaded_at
FROM images i
JOIN detections d ON i.id = d.image_id
WHERE i.street_id IS NULL
ORDER BY d.pothole_count DESC;


UPDATE images AS i
  SET town_id = s.town_id
  FROM streets AS s
  WHERE i.street_id = s.id
    AND i.town_id IS NULL;


