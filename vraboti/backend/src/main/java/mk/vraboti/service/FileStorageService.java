package mk.vraboti.service;

import mk.vraboti.web.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final Set<String> ALLOWED = Set.of("pdf", "doc", "docx");
    private final Path root;

    public FileStorageService(@Value("${app.upload-dir}") String dir) throws IOException {
        this.root = Path.of(dir).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    public String store(MultipartFile file) {
        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "cv" : file.getOriginalFilename());
        String ext = StringUtils.getFilenameExtension(original);
        if (ext == null || !ALLOWED.contains(ext.toLowerCase())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CV-то мора да биде PDF, DOC или DOCX");
        }
        String stored = UUID.randomUUID() + "." + ext.toLowerCase();
        try {
            Files.copy(file.getInputStream(), root.resolve(stored), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Датотеката не може да се зачува");
        }
        return stored;
    }

    public Resource load(String stored) {
        try {
            Path p = root.resolve(stored).normalize();
            if (!p.startsWith(root) || !Files.exists(p)) throw ApiException.notFound("CV-то");
            return new UrlResource(p.toUri());
        } catch (MalformedURLException e) {
            throw ApiException.notFound("CV-то");
        }
    }

    public void delete(String stored) {
        if (stored == null) return;
        try {
            Files.deleteIfExists(root.resolve(stored).normalize());
        } catch (IOException ignored) {
        }
    }
}
