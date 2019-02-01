export enum calcRows {
  payroll           = 14,
  lodging           = 15,
  perdiem           = 16,
  expenses          = 17,
  vacation          = 18,
  travel            = 19,
  training          = 20,
  standby           = 21,
  transportation    = 22,
  fuel              = 23,
  insurance         = 24,
  internal_salaries = 25,
  total_expenses    = 26,
}

export enum rowval {
  tech           = 0,
  payroll        = 1,
  lodging        = 2,
  perDiem        = 3,
  miscExps       = 4,
  vacation       = 5,
  travel         = 6,
  training       = 7,
  standby        = 8,
  transportation = 9,
  fuel           = 10,
  insurance      = 11,
  office         = 12,
  billing        = 13,
  expenses       = 14,
  profit         = 15,
  status         = 16,
}

export enum rotation2sequence {
  "FIRST WEEK" = 'A',
  "CONTN WEEK" = 'B',
  "FINAL WEEK" = 'C',
  "DAYS OFF"   = 'D',
  "UNASSIGNED" = 'X',
}
