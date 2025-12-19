<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { marked } from 'marked'
import { Copy, Check } from 'lucide-vue-next'

const props = defineProps<{
  content: string
}>()

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
})

const renderedContent = computed(() => {
  return marked.parse(props.content) as string
})

// Track copied state for code blocks
const copiedBlocks = ref<Set<number>>(new Set())

async function copyCode(code: string, index: number) {
  await navigator.clipboard.writeText(code)
  copiedBlocks.value.add(index)
  setTimeout(() => {
    copiedBlocks.value.delete(index)
  }, 2000)
}

// Extract code blocks for copy functionality
const codeBlocks = computed(() => {
  const blocks: string[] = []
  const regex = /```[\s\S]*?```/g
  let match
  while ((match = regex.exec(props.content)) !== null) {
    const code = match[0].replace(/```\w*\n?/, '').replace(/```$/, '').trim()
    blocks.push(code)
  }
  return blocks
})
</script>

<template>
  <div class="markdown-content prose prose-invert prose-sm max-w-none">
    <div v-html="renderedContent" />
  </div>
</template>

<style>
.markdown-content {
  color: var(--jarvis-text-primary);
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  color: #00D4FF;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-content h1 { font-size: 1.5em; }
.markdown-content h2 { font-size: 1.3em; }
.markdown-content h3 { font-size: 1.1em; }

.markdown-content p {
  margin-bottom: 0.75em;
  line-height: 1.6;
}

.markdown-content ul,
.markdown-content ol {
  padding-left: 1.5em;
  margin-bottom: 0.75em;
}

.markdown-content li {
  margin-bottom: 0.25em;
}

.markdown-content code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9em;
}

.markdown-content code:not(pre code) {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  padding: 0.1em 0.4em;
  border-radius: 4px;
  color: #00D4FF;
}

.markdown-content pre {
  background: #1A1F2E;
  border: 1px solid #1E3A5F;
  border-radius: 8px;
  padding: 1em;
  overflow-x: auto;
  margin: 1em 0;
  position: relative;
}

.markdown-content pre code {
  background: transparent;
  border: none;
  padding: 0;
  color: #E0F7FA;
}

.markdown-content blockquote {
  border-left: 3px solid #00D4FF;
  padding-left: 1em;
  margin: 1em 0;
  color: #8892B0;
  font-style: italic;
}

.markdown-content a {
  color: #00D4FF;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #1E3A5F;
  padding: 0.5em 1em;
  text-align: left;
}

.markdown-content th {
  background: rgba(0, 212, 255, 0.1);
  color: #00D4FF;
}

.markdown-content hr {
  border: none;
  border-top: 1px solid #1E3A5F;
  margin: 1.5em 0;
}

.markdown-content img {
  max-width: 100%;
  border-radius: 8px;
}
</style>
