function parseDjangoError(data) {
    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null) {
        let messages = [];
        for (const key in data) {
            if (Array.isArray(data[key])) {
                let field = key.charAt(0).toUpperCase() + key.slice(1);
                messages.push(`${field}: ${data[key].join(", ")}`);
            } else if (typeof data[key] === "string") {
                messages.push(`${key}: ${data[key]}`);
            }
        }
        return messages.join("\n");
    }
    return "Erro desconhecido.";
}