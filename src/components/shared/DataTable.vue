<script setup>
defineProps({
  columns: Array,  // [{ key: 'nombre', label: 'Nombre' }]
  data: Array,     // Datos de cualquier entidad
  loading: Boolean
})

const emit = defineEmits(['edit', 'delete', 'view'])
</script>

<template>
  <table class="data-table">
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">
          {{ col.label }}
        </th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in data" :key="item.id">
        <td v-for="col in columns" :key="col.key">
          {{ item[col.key] }}
        </td>
        <td>
          <button @click="emit('view', item)">Ver</button>
          <button @click="emit('edit', item)">Editar</button>
          <button @click="emit('delete', item.id)">Eliminar</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>