export const getRemainingTime = (expiredAt) => {
  if (expiredAt === null) {
    return "Lifetime";
  }
  
  const nowInSec = Math.floor(Date.now() / 1000);
  const diffSec = expiredAt - nowInSec;

  if (diffSec <= 0) {
    return "Lifetime";
  }

  const days = Math.floor(diffSec / 86400 );
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  if(days > 0 ){
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  else if(hours > 0){
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  else{
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  return days;
};

export const formatDate = (timestamp) => {
  const date = new Date(Number(timestamp) *1000);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
