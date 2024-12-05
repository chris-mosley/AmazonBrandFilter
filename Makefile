win-build-gecko:
	yarn win-build-gecko

win-build-chromium:
	yarn win-build-chromium

nix-build-gecko:
	yarn nix-build-gecko

nix-build-chromium:
	yarn nix-build-chromium

gecko-dashboard:
	yarn nix-build-chromium-dashboard

chromium-dashboard:
	yarn nix-build-chromium-dashboard

report:
	open report.html
