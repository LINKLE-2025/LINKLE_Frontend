export async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3) {
  let delay = 500;
  for (let i = 0; i < retries; i++) {
    try {
      // 성공 시 결과 반환
      return await fn();
    } catch (err) {
      // 실패 시 재시도
      if (i === retries - 1) throw err; // 마지막 실패는 그대로 던짐
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // backoff
    }
  }
}
