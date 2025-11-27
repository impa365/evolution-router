package transformer

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/EvolutionAPI/evolution-router/pkg/models"
)

type TransformerService struct{}

func NewTransformerService() *TransformerService {
	return &TransformerService{}
}

// TransformPayload aplica os mapeamentos de campos ao payload
func (s *TransformerService) TransformPayload(mappings []models.FieldMapping, originalPayload map[string]interface{}) (map[string]interface{}, error) {
	// Se não há mapeamentos, retorna o payload original
	if len(mappings) == 0 {
		return originalPayload, nil
	}

	transformed := make(map[string]interface{})

	for _, mapping := range mappings {
		if !mapping.Enabled {
			continue
		}

		// Extrair valor do campo de origem
		value, exists := s.getNestedField(originalPayload, mapping.SourceField)

		// Se não existe, usar valor padrão
		if !exists {
			if mapping.DefaultValue != "" {
				value = mapping.DefaultValue
			} else {
				continue // Pular se não há valor e não há default
			}
		}

		// Aplicar transformação
		transformedValue, err := s.applyTransform(value, mapping.TransformType)
		if err != nil {
			return nil, fmt.Errorf("error transforming field %s: %w", mapping.SourceField, err)
		}

		// Setar no campo de destino
		s.setNestedField(transformed, mapping.TargetField, transformedValue)
	}

	return transformed, nil
}

func (s *TransformerService) applyTransform(value interface{}, transformType string) (interface{}, error) {
	switch transformType {
	case "direct":
		return value, nil

	case "uppercase":
		if str, ok := value.(string); ok {
			return strings.ToUpper(str), nil
		}
		return value, nil

	case "lowercase":
		if str, ok := value.(string); ok {
			return strings.ToLower(str), nil
		}
		return value, nil

	case "trim":
		if str, ok := value.(string); ok {
			return strings.TrimSpace(str), nil
		}
		return value, nil

	case "json_encode":
		bytes, err := json.Marshal(value)
		if err != nil {
			return nil, err
		}
		return string(bytes), nil

	case "json_decode":
		if str, ok := value.(string); ok {
			var decoded interface{}
			if err := json.Unmarshal([]byte(str), &decoded); err != nil {
				return nil, err
			}
			return decoded, nil
		}
		return value, nil

	default:
		return value, nil
	}
}

func (s *TransformerService) getNestedField(data map[string]interface{}, path string) (interface{}, bool) {
	parts := strings.Split(path, ".")
	current := data

	for i, part := range parts {
		// Último elemento
		if i == len(parts)-1 {
			val, ok := current[part]
			return val, ok
		}

		// Navegar para o próximo nível
		next, ok := current[part]
		if !ok {
			return nil, false
		}

		// Tentar converter para map
		nextMap, ok := next.(map[string]interface{})
		if !ok {
			return nil, false
		}

		current = nextMap
	}

	return nil, false
}

func (s *TransformerService) setNestedField(data map[string]interface{}, path string, value interface{}) {
	parts := strings.Split(path, ".")

	// Se é um campo simples
	if len(parts) == 1 {
		data[parts[0]] = value
		return
	}

	// Navegar e criar estrutura se necessário
	current := data
	for i := 0; i < len(parts)-1; i++ {
		part := parts[i]

		next, ok := current[part]
		if !ok {
			// Criar novo map
			newMap := make(map[string]interface{})
			current[part] = newMap
			current = newMap
		} else {
			// Tentar converter para map
			nextMap, ok := next.(map[string]interface{})
			if !ok {
				// Se não é map, criar novo
				newMap := make(map[string]interface{})
				current[part] = newMap
				current = newMap
			} else {
				current = nextMap
			}
		}
	}

	// Setar o valor final
	current[parts[len(parts)-1]] = value
}
