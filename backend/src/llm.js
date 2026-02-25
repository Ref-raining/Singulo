/**
 * LLM 客户端封装
 * 支持 OpenAI 兼容接口（OpenAI / DeepSeek / 其他）
 * 返回结构化 JSON 输出
 */
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

const MODEL = process.env.MODEL_NAME || 'gpt-4o-mini'

/**
 * 调用 LLM，要求返回结构化 JSON
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<object>}
 */
export async function callLLM(systemPrompt, userPrompt) {
  const response = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
  })
  return JSON.parse(response.choices[0].message.content)
}
