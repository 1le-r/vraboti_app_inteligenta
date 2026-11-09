package mk.vraboti.web;

import mk.vraboti.dto.Dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> api(ApiException e) {
        return ResponseEntity.status(e.getStatus()).body(new ErrorResponse(e.getMessage(), e.getCode()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .findFirst().map(f -> f.getDefaultMessage()).orElse("Невалидни податоци");
        return ResponseEntity.badRequest().body(new ErrorResponse(msg));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> tooBig(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ErrorResponse("Датотеката е поголема од 5 MB"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> denied(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("Немате пристап"));
    }
}
