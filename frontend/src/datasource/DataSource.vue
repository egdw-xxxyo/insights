<template>
	<header class="sticky top-0 z-10 flex items-center justify-between bg-white px-5 py-2.5">
		<PageBreadcrumbs
			class="h-7"
			:items="[
				{ label: 'Джерела даних', route: { path: '/data-source' } },
				{ label: dataSource.doc.title },
			]"
		/>
	</header>

	<div class="mb-4 flex h-full flex-col gap-2 overflow-auto px-4">
		<div class="flex gap-2 overflow-visible py-1">
			<FormControl :placeholder="'Пошук за назвою'" v-model="searchQuery" :debounce="300">
				<template #prefix>
					<SearchIcon class="h-4 w-4 text-gray-500" />
				</template>
			</FormControl>
			<Button
				variant="outline"
				iconLeft="link-2"
				@click="router.push(`/data-source/${dataSource.doc.name}/relationships`)"
			>
				{{ __("Manage Relationships") }}
			</Button>
			<Dropdown
				placement="left"
				:button="{ icon: 'more-horizontal', variant: 'outline' }"
				:options="dropdownActions"
			/>
		</div>
		<ListView
			:columns="tableListColumns"
			:rows="filteredTableList"
			:row-key="'name'"
			:options="{
				showTooltip: false,
				getRowRoute: (table) => ({
					name: 'DataSourceTable',
					params: { name: dataSource.doc.name, table: table.name },
				}),
				emptyState: {
					title: 'Немає таблиць.',
					description: __('No tables to display.'),
					button: {
						label: 'Синхронізувати таблиці',
						variant: 'solid',
						onClick: syncTables,
					},
				},
			}"
		>
		</ListView>
	</div>

	<Dialog
		v-model="showDeleteDialog"
		:dismissable="true"
		:options="{
			title: 'Видалити джерело даних',
			message: 'Ви впевнені, що хочете видалити це джерело даних?',
			icon: { name: 'trash', appearance: 'danger' },
			actions: [
				{
					label: 'Видалити',
					variant: 'solid',
					theme: 'red',
					onClick: async () => {
						await dataSource.delete()
						router.push({ name: 'DataSourceList' })
					},
				},
			],
		}"
	>
	</Dialog>
</template>

<script setup lang="jsx">
import IndicatorIcon from '@/components/Icons/IndicatorIcon.vue'
import PageBreadcrumbs from '@/components/PageBreadcrumbs.vue'
import { __ } from '@/translation'
import { ListView } from 'frappe-ui'
import { SearchIcon } from 'lucide-vue-next'
import { computed, inject, provide, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import useDataSource from './useDataSource'

const props = defineProps({
	name: {
		type: String,
		required: true,
	},
})

const router = useRouter()
const dataSource = useDataSource(props.name)
provide('dataSource', dataSource)
dataSource.fetchTables()

const searchQuery = ref('')
const filteredTableList = computed(() => {
	const tableList = dataSource.tableList.filter((t) => !t.is_query_based)
	if (!tableList.length) return []
	if (!searchQuery.value) return tableList
	return tableList.filter((table) => {
		return table.label.toLowerCase().includes(searchQuery.value.toLowerCase())
	})
})

const showDeleteDialog = ref(false)
const dropdownActions = computed(() => {
	return [
		{
			label: 'Синхронізувати таблиці',
			icon: 'refresh-cw',
			onClick: syncTables,
		},
		{
			label: 'Видалити',
			icon: 'trash',
			onClick: () => (showDeleteDialog.value = true),
		},
	]
})

const $notify = inject('$notify')
function syncTables() {
	dataSource
		.syncTables()
		.catch((err) => $notify({ title: __('Error Syncing Tables'), variant: 'error' }))
}

watchEffect(() => {
	if (dataSource.doc?.name) {
		const title = dataSource.doc.title || dataSource.doc.name
		document.title = `${title} - Frappe Insights`
	}
})

const tableListColumns = [
	{ label: 'Таблиця', key: 'label' },
	{
		label: 'Статус',
		key: 'status',
		getLabel: ({ row }) => (row.hidden ? 'Вимкнено' : 'Увімкнено'),
		prefix: ({ row }) => {
			const color = row.hidden ? 'text-gray-500' : 'text-green-500'
			return <IndicatorIcon class={color} />
		},
	},
]
</script>
