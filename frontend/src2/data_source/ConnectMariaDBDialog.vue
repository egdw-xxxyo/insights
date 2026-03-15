<script setup lang="ts">
import { computed, ref } from 'vue'
import Form from '../components/Form.vue'
import useDataSourceStore from './data_source'
import { MariaDBDataSource } from './data_source.types'

const show = defineModel({
	default: false,
})

const database = ref<MariaDBDataSource>({
	database_type: 'MariaDB',
	title: '',
	host: 'localhost',
	port: 3306,
	database_name: '',
	username: '',
	password: '',
	use_ssl: false,
})

const form = ref()
const fields = [
	{
		name: 'title',
		label: 'Назва',
		type: 'text',
		placeholder: 'My Database',
		required: true,
	},
	{
		label: 'Хост',
		name: 'host',
		type: 'text',
		placeholder: 'localhost',
		required: true,
		defaultValue: 'localhost',
	},
	{
		label: 'Порт',
		name: 'port',
		type: 'number',
		placeholder: '3306',
		required: true,
		defaultValue: 3306,
	},
	{
		label: 'Назва бази даних',
		name: 'database_name',
		type: 'text',
		placeholder: 'DB_1267891',
		required: true,
	},
	{
		label: "Ім'я користувача",
		name: 'username',
		type: 'text',
		placeholder: 'read_only_user',
		required: true,
	},
	{
		label: 'Пароль',
		name: 'password',
		type: 'password',
		placeholder: '**********',
		required: true,
	},
	{ label: 'Використовувати захищене з\'єднання (SSL)?', name: 'use_ssl', type: 'checkbox' },
]

const sources = useDataSourceStore()

const connected = ref<boolean | null>(null)
const connectButton = computed(() => {
	const _button = {
		label: "З'єднати",
		disabled: form.value?.hasRequiredFields === false || sources.testing || sources.creating,
		loading: sources.testing,
		variant: 'subtle',
		theme: 'gray',
		onClick() {
			sources.testConnection(database.value).then((result: boolean) => {
				connected.value = Boolean(result)
			})
		},
	}

	if (sources.testing) {
		_button.label = "З'єднання..."
	} else if (connected.value) {
		_button.label = "З'єднано"
		_button.variant = 'outline'
		_button.theme = 'green'
	} else if (connected.value === false) {
		_button.label = 'Помилка, спробувати ще?'
		_button.variant = 'outline'
		_button.theme = 'red'
	}

	return _button
})

const submitButton = computed(() => {
	return {
		label: 'Додати джерело даних',
		disabled: form.value?.hasRequiredFields === false || !connected.value || sources.creating,
		loading: sources.creating,
		variant: connected.value ? 'solid' : 'subtle',
		onClick() {
			sources.createDataSource(database.value).then(() => {
				show.value = false
			})
		},
	}
})
</script>

<template>
	<Dialog v-model="show" :options="{ title: 'З\'єднання з MariaDB' }">
		<template #body-content>
			<Form
				ref="form"
				class="flex-1"
				v-model="database"
				:fields="fields"
				:actions="[connectButton, submitButton]"
			>
			</Form>
		</template>
	</Dialog>
</template>
