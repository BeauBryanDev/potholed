def calculate_estimated_location(
    lat_start: float, lon_start: float, 
    lat_end: float, lon_end: float, 
    segment_index: int = 1, 
    total_segments: int = 1
) -> tuple[float, float]:
    """
    Computes the estimated latitude and longitude for a given segment of a street.
    
    Args:
        lat_start (float): Latitude of the start point of the segment.
        lon_start (float): Longitude of the start point of the segment.
        lat_end (float): Latitude of the end point of the segment.
        lon_end (float): Longitude of the end point of the segment.
        segment_index (int, optional): Index of the segment (1-based). Defaults to 1.
        total_segments (int, optional): Total number of segments in the street. Defaults to 1.
    
    Returns:
        tuple[float, float]: Estimated latitude and longitude.
    """
    # Avoid zero division
    if total_segments < 1:
        total_segments = 1
        

    progress = (segment_index - 0.5) / total_segments

    est_lat = lat_start + (lat_end - lat_start) * progress
    est_lon = lon_start + (lon_end - lon_start) * progress
    
    return round(est_lat, 6), round(est_lon, 6)


