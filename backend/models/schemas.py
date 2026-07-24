from pydantic import BaseModel
from typing import List, Dict

class OccupancyTrendItem(BaseModel):
    time: str
    occupancy: int

class ZoneCounts(BaseModel):
    left: int
    center: int
    right: int

class AnalysisResponse(BaseModel):
    processedVideo: str
    heatmap: str
    currentOccupancy: int
    peakOccupancy: int
    averageOccupancy: int
    uniquePeople: int
    processingTime: float
    occupancyTrend: List[OccupancyTrendItem]
    zoneCounts: ZoneCounts
    recommendation: str
