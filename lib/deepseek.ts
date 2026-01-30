interface MessageContext {
  senderName?: string;
  senderCompany?: string;
  senderTitle?: string;
  senderInterests?: string;
  recipientName: string;
  recipientSchool?: string;
  recipientCompany?: string;
  commonalities: string[];
  tone?: 'professional' | 'friendly';
}

function buildPrompt(context: MessageContext, commonalities: string[]): string {
  const tone = context.tone || 'professional';
  
  let prompt = `Write a ${tone} LinkedIn connection request message.\n\n`;
  
  // Sender info
  prompt += `From: ${context.senderName || 'User'}`;
  if (context.senderTitle) {
    prompt += `, ${context.senderTitle}`;
  }
  if (context.senderCompany) {
    prompt += ` at ${context.senderCompany}`;
  }
  prompt += '\n';
  
  // Recipient info
  prompt += `To: ${context.recipientName}`;
  if (context.recipientSchool) {
    prompt += ` (${context.recipientSchool} alumni)`;
  }
  if (context.recipientCompany) {
    prompt += ` at ${context.recipientCompany}`;
  }
  prompt += '\n\n';
  
  // Commonalities (if any)
  if (commonalities.length > 0) {
    prompt += 'Commonalities to highlight:\n';
    commonalities.forEach(c => prompt += `- ${c}\n`);
    prompt += '\n';
  }
  
  // Sender's interests/context
  if (context.senderInterests) {
    prompt += `Sender's interests/focus: ${context.senderInterests}\n\n`;
  }
  
  prompt += `Requirements:
- Maximum 250 characters (strict LinkedIn connection request limit)
- ${tone === 'professional' ? 'Professional but warm' : 'Friendly and approachable'} tone
- ${commonalities.length > 0 ? 'Lead with the commonality naturally' : 'Focus on mutual interests or school connection'}
- Include a subtle reason to connect
- No generic phrases like "I came across your profile"
- Make it feel personal and genuine
- Do NOT use emojis`;

  return prompt;
}
