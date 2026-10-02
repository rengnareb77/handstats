from pydantic import BaseModel
from typing import Literal, Optional


class Score(BaseModel):
  finalScore:int
  halfScore:int

class MatchPlayer(BaseModel):
  isCaptain:bool
  tshirtNumber:int
  fullName:str
  licenseNumber:str
  goal:int
  sevenMeter:int
  shot:int
  save:int
  avertissement:bool
  twoMinutes:int
  redCard:bool



class MatchEvent(BaseModel):
  type:Literal["GOAL","SEVEN_METER","TWO_MINUTE","YELLOW_CARD","RED_CARD","SAVE","SHOT","TIMEOUT"]
  time:str
  matchPlayerName:str
  sector: Literal["WING_L","WING_R","CENTER","PIVOT","BACK_L","BACK_R","GOALKEEPER"] | None = None

class Match(BaseModel):
  codeRencontre:str
  homeTeamName:str
  awayTeamName:str
  homeScore:Score
  awayScore:Score
  homeTeamPlayers:list[MatchPlayer]
  awayTeamPlayers:list[MatchPlayer]
  events:list[MatchEvent]




