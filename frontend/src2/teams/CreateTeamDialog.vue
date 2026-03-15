<script setup lang="ts">
import { ref } from 'vue'
import useTeamStore from './teams'

const show = defineModel()
const teamStore = useTeamStore()
const newTeamName = ref('')
</script>

<template>
	<Dialog
		v-model="show"
		:options="{
			title: 'Створити команду',
			actions: [
				{
					label: 'Створити',
					variant: 'solid',
					disabled: !newTeamName || teamStore.creatingTeam,
					loading: teamStore.creatingTeam,
					onClick: () => {
						teamStore.createTeam(newTeamName).then(() => {
							newTeamName = ''
							show = false
						})
					},
				},
			],
		}"
	>
		<template #body-content>
			<div class="flex flex-col gap-4">
				<FormControl label="Назва команди" v-model="newTeamName" autocomplete="off" />
			</div>
		</template>
	</Dialog>
</template>
