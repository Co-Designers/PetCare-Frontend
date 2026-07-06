export function resolveCurrentMobileId(userId: number | null | undefined): number | null {
  if (!userId) return null;

  const storedMobileId = Number(localStorage.getItem('mobileProfessionalId'));
  if (!Number.isNaN(storedMobileId) && storedMobileId > 0) return storedMobileId;

  const username = localStorage.getItem('username');
  const demoMobileIds: Record<string, number> = {
    mobile1: 1,
    mobile2: 2,
    mobile3: 3,
  };

  return username && demoMobileIds[username] ? demoMobileIds[username] : userId;
}
