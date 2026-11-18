import io.github.treesitter.jtreesitter.Language;
import io.github.treesitter.jtreesitter.vala.TreeSitterVala;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

public class TreeSitterValaTest {
    @Test
    public void testCanLoadLanguage() {
        assertDoesNotThrow(() -> new Language(TreeSitterVala.language()));
    }
}
