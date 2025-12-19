<script setup lang="ts">
import StatusIndicator from '../jarvis/StatusIndicator.vue'

defineProps<{
  hasApiKey: boolean
  mcpCount: number
}>()
</script>

<template>
  <div class="p-3 border-b border-jarvis-border space-y-2">
    <div class="text-xs font-medium text-jarvis-text-muted uppercase tracking-wider mb-2">
      STATUS
    </div>

    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <StatusIndicator
          :status="hasApiKey ? 'online' : 'offline'"
          label="API"
          size="sm"
        />
        <span class="text-xs text-jarvis-text-muted">
          {{ hasApiKey ? 'Connected' : 'Not configured' }}
        </span>
      </div>

      <div class="flex items-center justify-between">
        <StatusIndicator
          :status="mcpCount > 0 ? 'online' : 'offline'"
          label="MCP"
          size="sm"
        />
        <span class="text-xs text-jarvis-text-muted">
          {{ mcpCount }} server{{ mcpCount !== 1 ? 's' : '' }}
        </span>
      </div>

      <div class="flex items-center justify-between">
        <StatusIndicator
          status="online"
          label="Voice"
          size="sm"
        />
        <span class="text-xs text-jarvis-text-muted">
          Ready
        </span>
      </div>
    </div>
  </div>
</template>
