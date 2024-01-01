export function dateDiffInSeconds(date1: Date, date2: Date): number {
  const diffInMilliseconds: number = Math.abs(date2.getTime() - date1.getTime())
  const hours: number = diffInMilliseconds / 1000
  return hours
}

export function getAgeInSeconds(createdAt: string) {
  const nowTimeStamp = new Date().getTime()
  const createdAtConverted = createdAt.split(' ').join('T').concat('Z')
  const createdAtTimeStamp = Date.parse(createdAtConverted)

  const ageInSeconds: number =
    Math.abs(createdAtTimeStamp - nowTimeStamp) / 1000

  return ageInSeconds
}
