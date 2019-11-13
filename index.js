try {
	const fs = require('fs')
	const path = require('path')

	const dataArr = []

	for (let i = 1; i < 61; i++) {
		const stringData = fs.readFileSync(path.resolve(__dirname, `./data${i}.json`))
		const parsedData = JSON.parse(stringData)
		dataArr.push(parsedData)
	}

	let totalPowerkW = 0
	let totalAirVolume = 0
	let totalSavingPercentage = 0
	const workStationStats = {}

	for (const { data, timestamp } of dataArr) {
		const {
			system,
			workstations
		} = data

		const {
			power,
			savings
		} = system

		totalPowerkW += power.value
		totalSavingPercentage += savings.value

		for (const workStation of workstations) {
			const {
				id,
				active,
				diameter,
				airVelocity
			} = workStation

			const diameterMeter = diameter.value / 1000
			const radius = diameterMeter / 2
			const crossSectionArea = Math.PI * Math.pow(radius, 2)
			const averageAirVolume = crossSectionArea * (airVelocity.value * 3600)

			totalAirVolume += averageAirVolume

			workStationStats[id] = {
				...workStationStats[id],
				[timestamp]: {
					active,
					averageAirVolume,
					averageAirVelocity: airVelocity.value,
				}
			}
		}
	}

	const overAllWorkStationStats = {}

	for (const [id, stats] of Object.entries(workStationStats)) {
		let countOfActive = 0
		let overallAirVolume = 0
		let overallAirVelocity = 0

		for (const statsObj of Object.values(stats)) {
			const {
				active,
				averageAirVolume,
				averageAirVelocity,
			} = statsObj

			if (!active) continue
			countOfActive++
			overallAirVolume += averageAirVolume
			overallAirVelocity += averageAirVelocity
		}

		overAllWorkStationStats[id] = {
			utilization: (countOfActive / 60) * 100,
			averageAirVolicty: overallAirVolume / countOfActive,
			averageAirVolume: overallAirVelocity / countOfActive
		}
	}

	const totalUtilization = Object.values(overAllWorkStationStats).reduce((acc, { utilization }) => {
		acc += utilization
		return acc
	}, 0)

	const averageWorkStationUtilization = totalUtilization / 10

	const systemsStats = {
		averageWorkStationUtilization,
		averagePower: totalPowerkW / 60,
		averageSaving: (totalSavingPercentage / 60) * 100,
		averageAirVolume: totalAirVolume / 10,
		energyConsumedkWH: totalPowerkW
	}

	console.log({
		systemsStats,
		overAllWorkStationStats
	})

} catch (err) {
	console.log(err)
}




// try {
// 	const WebSocket = require('ws')
// 	const fs = require('fs')

// 	const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWVkIjoibWFyZWsiLCJpYXQiOjE1NzM2NzQwNzYsImV4cCI6MTU3Mzc2MDQ3NiwiaXNzIjoiZWNvZ2F0ZSIsInN1YiI6InN3LWVuZyJ9.5M1c2s0m1GuNJ1TaEu0FyBdcZNqSyNCuhsOOAWpdPWo"
// 	const url = "wss://data-gen.test.ecogate.com"

// 	const ws = new WebSocket(url)

// 	ws.on('open', function open() {
// 		try {
// 			ws.send(JSON.stringify({ token }))
// 		} catch (err) {
// 			console.log(err)
// 		}
// 	})

// 	let i = 0
// 	ws.on('message', function incoming(stringData) {
// 		try {
// 			i++
// 			fs.writeFileSync(`data${i}.json`, stringData)
// 			// const {
// 			// 	data,
// 			// 	timestamp,
// 			// } = JSON.parse(stringData)

// 			// const {
// 			// 	system,
// 			// 	workstations
// 			// } = data

// 			// const {
// 			// 	power,
// 			// 	savings
// 			// } = system

// 			// console.log({ power, savings })
// 		} catch (err) {
// 			console.log(err, "message error")
// 		}
// 	})
// } catch (err) {
// 	console.log(err)
// }
