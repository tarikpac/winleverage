export function generateBusinessDays(startDate: Date, numberOfDays: number): Date[] {
  const businessDays: Date[] = [];
  const current = new Date(startDate);
  
  while (businessDays.length < numberOfDays) {
    const dayOfWeek = current.getDay();
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays.push(new Date(current));
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });
}
