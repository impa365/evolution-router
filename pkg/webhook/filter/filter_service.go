package filter

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/EvolutionAPI/evolution-router/pkg/models"
)

type FilterService struct{}

func NewFilterService() *FilterService {
	return &FilterService{}
}

// ApplyFilters verifica se o payload passa por todos os filtros ativos
func (s *FilterService) ApplyFilters(filters []models.Filter, payload map[string]interface{}) (bool, error) {
	// Se não há filtros, passa
	if len(filters) == 0 {
		return true, nil
	}

	// Todos os filtros ativos devem passar (AND logic)
	for _, filter := range filters {
		if !filter.Enabled {
			continue
		}

		passed, err := s.checkFilter(filter, payload)
		if err != nil {
			return false, fmt.Errorf("error checking filter %s: %w", filter.ID, err)
		}

		if !passed {
			return false, nil
		}
	}

	return true, nil
}

func (s *FilterService) checkFilter(filter models.Filter, payload map[string]interface{}) (bool, error) {
	switch filter.Type {
	case "event_type":
		return s.checkEventType(filter, payload)
	case "field_value":
		return s.checkFieldValue(filter, payload)
	case "custom":
		return s.checkCustom(filter, payload)
	default:
		return false, fmt.Errorf("unknown filter type: %s", filter.Type)
	}
}

func (s *FilterService) checkEventType(filter models.Filter, payload map[string]interface{}) (bool, error) {
	eventType, ok := payload["event"].(string)
	if !ok {
		// Tentar em event_type também
		eventType, ok = payload["event_type"].(string)
		if !ok {
			return false, nil
		}
	}

	return s.compareValues(eventType, filter.Condition, filter.Value)
}

func (s *FilterService) checkFieldValue(filter models.Filter, payload map[string]interface{}) (bool, error) {
	// Extrair valor do campo usando field path (ex: data.message.text)
	value, exists := s.getNestedField(payload, filter.FieldPath)
	if !exists {
		// Se o campo não existe, só passa se a condição for "not_exists"
		return filter.Condition == "not_exists", nil
	}

	// Converter valor para string para comparação
	valueStr := s.valueToString(value)

	return s.compareValues(valueStr, filter.Condition, filter.Value)
}

func (s *FilterService) checkCustom(filter models.Filter, payload map[string]interface{}) (bool, error) {
	// Implementação de lógica customizada
	// Por enquanto, apenas retorna true
	return true, nil
}

func (s *FilterService) compareValues(actual, condition, expected string) (bool, error) {
	switch condition {
	case "equals":
		return actual == expected, nil

	case "not_equals":
		return actual != expected, nil

	case "contains":
		return strings.Contains(strings.ToLower(actual), strings.ToLower(expected)), nil

	case "not_contains":
		return !strings.Contains(strings.ToLower(actual), strings.ToLower(expected)), nil

	case "starts_with":
		return strings.HasPrefix(strings.ToLower(actual), strings.ToLower(expected)), nil

	case "ends_with":
		return strings.HasSuffix(strings.ToLower(actual), strings.ToLower(expected)), nil

	case "regex":
		matched, err := regexp.MatchString(expected, actual)
		if err != nil {
			return false, fmt.Errorf("invalid regex: %w", err)
		}
		return matched, nil

	case "exists":
		return actual != "", nil

	case "not_exists":
		return actual == "", nil

	case "gt": // Greater than (numérico)
		actualNum, err1 := strconv.ParseFloat(actual, 64)
		expectedNum, err2 := strconv.ParseFloat(expected, 64)
		if err1 != nil || err2 != nil {
			return false, nil
		}
		return actualNum > expectedNum, nil

	case "lt": // Less than (numérico)
		actualNum, err1 := strconv.ParseFloat(actual, 64)
		expectedNum, err2 := strconv.ParseFloat(expected, 64)
		if err1 != nil || err2 != nil {
			return false, nil
		}
		return actualNum < expectedNum, nil

	case "gte": // Greater than or equal
		actualNum, err1 := strconv.ParseFloat(actual, 64)
		expectedNum, err2 := strconv.ParseFloat(expected, 64)
		if err1 != nil || err2 != nil {
			return false, nil
		}
		return actualNum >= expectedNum, nil

	case "lte": // Less than or equal
		actualNum, err1 := strconv.ParseFloat(actual, 64)
		expectedNum, err2 := strconv.ParseFloat(expected, 64)
		if err1 != nil || err2 != nil {
			return false, nil
		}
		return actualNum <= expectedNum, nil

	default:
		return false, fmt.Errorf("unknown condition: %s", condition)
	}
}

func (s *FilterService) getNestedField(data map[string]interface{}, path string) (interface{}, bool) {
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

func (s *FilterService) valueToString(value interface{}) string {
	if value == nil {
		return ""
	}

	switch v := value.(type) {
	case string:
		return v
	case int, int64, float64:
		return fmt.Sprintf("%v", v)
	case bool:
		return strconv.FormatBool(v)
	case map[string]interface{}, []interface{}:
		// Para objetos complexos, retornar JSON
		bytes, _ := json.Marshal(v)
		return string(bytes)
	default:
		return fmt.Sprintf("%v", v)
	}
}
