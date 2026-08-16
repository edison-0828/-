package vip.xiaonuo.zj.modular.favorite.param;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ZjFavoriteToggleParam {
    @NotBlank(message = "房源ID不能为空")
    private String listingId;
}
