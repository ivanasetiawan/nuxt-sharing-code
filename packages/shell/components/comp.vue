<template>
  <comp class="overridden"/>
</template>

<style>
  .overridden { text-transform: uppercase; }
</style>

<script>
import comp from 'portal-one/components/comp.vue'
export default {
  components: { comp },
}
</script>