export function formatApiError(err: any, fallbackMessage: string): string {
  if (!err) return fallbackMessage;

  const msg = String(err?.message || "").toLowerCase();

  // Casos comuns de rede
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return "Falha de conexão. Verifique sua internet ou tente novamente.";
  }

  if (msg.includes("unauthorized") || msg.includes("401")) {
    return "Sessão expirada. Faça login novamente.";
  }

  if (msg.includes("forbidden") || msg.includes("403")) {
    return "Você não tem permissão para executar esta ação.";
  }

  if (msg.includes("not found") || msg.includes("404")) {
    return "Recurso não encontrado.";
  }

  return fallbackMessage; // mensagem padrão definida no contexto da ação
}
