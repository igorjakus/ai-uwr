NUMER := $(word 2,$(MAKECMDGOALS))

.PHONY: pdf
pdf:
	@test -n "$(NUMER)" || (echo "Użycie: make pdf 1"; exit 1)
	mkdir -p sprawozdania
	uv run --with 'nbconvert[webpdf]' jupyter nbconvert "rozwiazania/$(NUMER).ipynb" --to webpdf --no-input --allow-chromium-download --output "sprawozdanie_$(NUMER)_Igor_Jakus" --output-dir sprawozdania

%:
	@:
