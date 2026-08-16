package vip.xiaonuo.zj.modular.viewing.param;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ZjViewingCreateParam {
    @NotBlank(message = "房源ID不能为空")
    private String listingId;
    @NotNull(message = "看房日期不能为空")
    @FutureOrPresent(message = "看房日期不能早于今天")
    private LocalDate preferredDate;
    @NotBlank(message = "看房时间不能为空")
    private String preferredTime;
    @NotBlank(message = "联系电话不能为空")
    private String contactPhone;
    @Size(max = 500, message = "留言不能超过500字")
    private String message;
}
