'use strict'

const sheath = require('../../../src/sheath')



describe('devMode enables more advanced debugging tools', () => {
	sheath.config.mode('dev').emulateBrowser(true).async(false)

	it('logs a warning when lazy-loading is disabled, sync phase has ended, and undeclared modules are found', () => {
		return new Promise(resolve => {
			console.warn = warning => {
				resolve(warning)
			}
			sheath('module1', 'nonexistent-module', () => {})
		}).then(result => {
			expect(result).toMatch(/lazy-loading.*disabled/i)
		})
	})

	it('logs a warning when a simple circular dependency is detected', () => {
		return new Promise(resolve => {
			setTimeout(() => {
				console.warn = warning => {
					resolve(warning)
				}
				sheath('module2', 'module3', () => {})
				sheath('module3', 'module2', () => {})
			})
		}).then(result => {
			expect(result).toMatch(/circular dependency detected/mi)
			expect(result).toMatch(/module2/mi)
			expect(result).toMatch(/module3/mi)
			expect(result.split('->')).toHaveLength(3)
		})
	})
	
	it('logs a warning when sheath.current() is called outside a module definition', () => {
		console.warn = jest.fn()
		sheath.current()
		expect(console.warn).toHaveBeenCalled()
	})
})
