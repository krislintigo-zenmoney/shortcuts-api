export interface ZenmoneyUser {
  id: number
  changed: number
  login: string
  currency: number
  parent: number | null
}

export interface ZenmoneyAccount {
  id: string
  changed: number
  /** user ID **/
  user: number
  /** instrument ID **/
  instrument: number
  /** user ID **/
  role: number | null
  type: 'cash' | 'ccard' | 'checking' | 'loan' | 'deposit' | 'emoney' | 'debt'

  title: string

  creditLimit: number
  startBalance: number
  balance: number
  /** company ID **/
  company: number
  syncID: string[] | null

  /**
   * Tech props
   * **/

  inBalance: boolean
  savings: boolean
  private: boolean
  enableSMS: true
  enableCorrection: boolean
  balanceCorrectionType: 'request'
  archive: boolean

  /**
   * Loan / Deposit-only properties for calc
   * **/

  capitalization: boolean | null
  percent: number | null
  startDate: string | null
  endDateOffset: number | null
  endDateOffsetInterval: ('day' | 'week' | 'month' | 'year') | null
  payoffStep: number | null
  payoffInterval: ('month' | 'year') | null
}

export interface ZenmoneyTag {
  id: string
  changed: number
  /** user ID **/
  user: number
  /** parent tag ID or null **/
  parent: string | null

  title: string
  /** icon internal ID or null **/
  icon: string | null
  picture: string | null
  /** color 32-bit integer or null **/
  color: number | null

  /**
   * Tech props
   * **/

  showIncome: boolean
  showOutcome: boolean
  budgetIncome: boolean
  budgetOutcome: boolean
  required: boolean
}

export interface ZenmoneyTransaction {
  id: string
  created: number
  changed: number
  /** User ID **/
  user: number
  deleted: boolean
  hold: boolean | null
  viewed?: boolean

  /**
   * Income/outcome in account currency
   * **/

  incomeInstrument: number
  incomeAccount: string
  income: number
  outcomeInstrument: number
  outcomeAccount: string
  outcome: number

  /**
   * Income/outcome in original currency
   * (defined only if currency differs from account currency)
   * **/

  opIncome: number | null
  opIncomeInstrument: number | null
  opOutcome: number | null
  opOutcomeInstrument: number | null

  tag: string[] | null
  merchant: string | null
  payee: string | null
  originalPayee: string | null
  comment: string | null

  date: string
  mcc: number | null

  reminderMarker: string | null
  latitude: number | null
  longitude: number | null

  qrCode: null
  source: null
  incomeBankID: null
  outcomeBankID: null
}
